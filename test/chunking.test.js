const chunk = require('../chunk');

test('chunking project with empty tree returns one entry', () => {
  const project = {
    meta: {
      name: "test entry",
      type: "step"
    },
    tree: {}
  }
  const chunked = {
    id: "project-id",
    meta: {
      name: "test entry",
      type: "step"
    },
    tree: [],
    ancestors: []
  }
  expect(chunk("project-id", project)).toEqual([chunked])
});

test('chunking project with one child adds ancestors', () => {
  const child = {
      meta: {
        name: "test child",
        type: "step"
      },
      tree: {},
  }
  const project = {
    meta: {
      name: "test project",
      type: "step"
    },
    tree: {
      "the-child-id": child
    }
  }
  const newProject = {
    id: "project-id",
    meta: {
      name: "test project",
      type: "step"
    },
    tree: [
      "someidhere"
    ],
    ancestors: []
  }
  const newChild = {
    id: "someidhere",
    meta: {
      name: "test child",
      type: "step"
    },
    tree: [],
    ancestors: ["project-id"]
  }
  expect(chunk("project-id", project)).toEqual([newProject, newChild])
});
