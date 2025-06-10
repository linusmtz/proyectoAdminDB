// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const {
  DynamoDBClient,
  ScanCommand,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand
} = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors(), express.json());

const db = new DynamoDBClient({ region: process.env.AWS_REGION });
const TABLE = process.env.DYNAMODB_TABLE;

// 🔁 Función para convertir item de DynamoDB a objeto JS
const parseItem = (item) => ({
  id: item.TaskID?.S,
  title: item.title?.S,
  description: item.description?.S || "",
  priority: item.priority?.S || "medium",
  category: item.category?.S || "Personal",
  completed: item.completed?.BOOL || false,
  createdAt: item.createdAt?.S,
});

// 1️⃣ Listar todas las tareas
app.get('/tasks', async (_req, res) => {
  try {
    const { Items } = await db.send(new ScanCommand({ TableName: TABLE }));
    const tasks = Items.map(parseItem);
    res.json(tasks);
  } catch (error) {
    console.error('Error listing tasks:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2️⃣ Obtener una tarea por ID
app.get('/tasks/:id', async (req, res) => {
  try {
    const { Item } = await db.send(
      new GetItemCommand({
        TableName: TABLE,
        Key: { TaskID: { S: req.params.id } },
      })
    );
    if (!Item) return res.status(404).json({ error: 'Not found' });
    res.json(parseItem(Item));
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3️⃣ Crear nueva tarea
app.post('/tasks', async (req, res) => {
  try {
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const {
      title,
      description = "",
      priority = "medium",
      category = "Personal",
      completed = false,
    } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Field "title" is required and must be a string.' });
    }

    const item = {
      TaskID: { S: id },
      title: { S: title },
      description: { S: description },
      priority: { S: priority },
      category: { S: category },
      completed: { BOOL: completed },
      createdAt: { S: createdAt },
    };

    await db.send(new PutItemCommand({ TableName: TABLE, Item: item }));

    res.status(201).json({ id, title, description, priority, category, completed, createdAt });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4️⃣ Actualizar tarea existente
app.put('/tasks/:id', async (req, res) => {
  try {
    const updates = req.body;

    const expressions = [];
    const ExpressionAttributeNames = {};
    const ExpressionAttributeValues = {};

    for (const key of ['title', 'description', 'priority', 'category', 'completed']) {
      if (updates[key] !== undefined) {
        const attrName = `#${key}`;
        const attrValue = `:${key}`;
        expressions.push(`${attrName} = ${attrValue}`);
        ExpressionAttributeNames[attrName] = key;
        ExpressionAttributeValues[attrValue] =
          typeof updates[key] === 'boolean'
            ? { BOOL: updates[key] }
            : { S: String(updates[key]) };
      }
    }

    if (expressions.length === 0) {
      return res.status(400).json({ error: "No valid fields to update." });
    }

    const command = new UpdateItemCommand({
      TableName: TABLE,
      Key: { TaskID: { S: req.params.id } },
      UpdateExpression: 'SET ' + expressions.join(', '),
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ReturnValues: "ALL_NEW",
    });

    const result = await db.send(command);
    const updatedItem = parseItem(result.Attributes);
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 5️⃣ Borrar tarea
app.delete('/tasks/:id', async (req, res) => {
  try {
    await db.send(new DeleteItemCommand({
      TableName: TABLE,
      Key: { TaskID: { S: req.params.id } }
    }));
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 🔁 Servir frontend
app.use(express.static(path.join(__dirname, '../public')));
app.get(/.*/, (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

// 🚀 Iniciar servidor
const port = parseInt(process.env.API_PORT, 10) || 3000;
app.listen(port, '0.0.0.0', () => console.log(`API listening on port ${port}`));
