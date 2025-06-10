// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { DynamoDBClient, ScanCommand, GetItemCommand,
        PutItemCommand, UpdateItemCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors(), express.json());

const db = new DynamoDBClient({ region: process.env.AWS_REGION });
const TABLE = process.env.DYNAMODB_TABLE;

// 1) LISTAR todas las tareas
app.get('/tasks', async (_req, res) => {
  const { Items } = await db.send(new ScanCommand({ TableName: TABLE }));
  res.json(Items);
});

// 2) OBTENER una tarea por ID
app.get('/tasks/:id', async (req, res) => {
  const { Item } = await db.send(
    new GetItemCommand({ TableName: TABLE, Key:{ id: { S: req.params.id } } })
  );
  if (!Item) return res.status(404).json({ error: 'Not found' });
  res.json(Item);
});

// 3) CREAR nueva tarea
app.post('/tasks', async (req, res) => {
  const id = uuidv4(), { name } = req.body;
  await db.send(new PutItemCommand({
    TableName: TABLE,
    Item: { id: { S: id }, name: { S: name } }
  }));
  res.status(201).json({ id, name });
});

// 4) ACTUALIZAR tarea existente
app.put('/tasks/:id', async (req, res) => {
  const { name } = req.body;
  await db.send(new UpdateItemCommand({
    TableName: TABLE,
    Key: { id: { S: req.params.id } },
    UpdateExpression: 'SET #n = :v',
    ExpressionAttributeNames: { '#n': 'name' },
    ExpressionAttributeValues: { ':v': { S: name } }
  }));
  res.json({ id: req.params.id, name });
});

// 5) BORRAR tarea
app.delete('/tasks/:id', async (req, res) => {
  await db.send(new DeleteItemCommand({
    TableName: TABLE,
    Key: { id: { S: req.params.id } }
  }));
  res.sendStatus(204);
});

// Iniciar servidor
const port = parseInt(process.env.API_PORT, 10) || 3000;
app.listen(port, () => console.log(`API listening on port ${port}`));
