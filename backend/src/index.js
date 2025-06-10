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

// 1) LISTAR todas las tareas
app.get('/tasks', async (_req, res) => {
  try {
    const { Items } = await db.send(new ScanCommand({ TableName: TABLE }));
    res.json(Items);
  } catch (error) {
    console.error('Error listing tasks:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2) OBTENER una tarea por ID
app.get('/tasks/:id', async (req, res) => {
  try {
    const { Item } = await db.send(
      new GetItemCommand({ TableName: TABLE, Key: { id: { S: req.params.id } } })
    );
    if (!Item) return res.status(404).json({ error: 'Not found' });
    res.json(Item);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3) CREAR nueva tarea
app.post('/tasks', async (req, res) => {
  try {
    const id = uuidv4();
    const { name } = req.body;
    await db.send(new PutItemCommand({
      TableName: TABLE,
      Item: { id: { S: id }, name: { S: name } }
    }));
    res.status(201).json({ id, name });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4) ACTUALIZAR tarea existente
app.put('/tasks/:id', async (req, res) => {
  try {
    const { name } = req.body;
    await db.send(new UpdateItemCommand({
      TableName: TABLE,
      Key: { id: { S: req.params.id } },
      UpdateExpression: 'SET #n = :v',
      ExpressionAttributeNames: { '#n': 'name' },
      ExpressionAttributeValues: { ':v': { S: name } }
    }));
    res.json({ id: req.params.id, name });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 5) BORRAR tarea
app.delete('/tasks/:id', async (req, res) => {
  try {
    await db.send(new DeleteItemCommand({
      TableName: TABLE,
      Key: { id: { S: req.params.id } }
    }));
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ### SERVIR FRONTEND ###
app.use(express.static(path.join(__dirname, '../public')));

app.get(/.*/, (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

// ### INICIAR SERVIDOR ###
const port = parseInt(process.env.API_PORT, 10) || 3000;
app.listen(port, '0.0.0.0', () => console.log(`API listening on port ${port}`));
