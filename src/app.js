const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require('uuidv4');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function validateRepositoryID(request, response, next) {
  const { id } = request.params;

  if(!isUuid(id)){
    return response.status(400).json({ error: "Invalid repository ID." })
  }

  return next();
}

function getRepositoryIndex(request, response, next) {
  const { id } = request.params;

  const repoIndex = repositories.findIndex(repo => repo.id === id);

  if(repoIndex < 0) {
    return response.status(400).json({ error: "Repository not found" })
  }

  request.index = repoIndex;

  return next();
}

app.use('/repositories/:id', validateRepositoryID, getRepositoryIndex);

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {id: uuid(), title, url, techs, likes: 0};

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { title, url, techs } = request.body;
  
  const repository = {
    id: repositories[request.index].id,
    title,
    url, 
    techs,
    likes: repositories[request.index].likes
  }

  repositories[request.index] = repository

  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  repositories.splice(request.index, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  repositories[request.index].likes++;

  return response.json(repositories[request.index])
});

module.exports = app;
