import api from "../utils/api";

export const listAuthors = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
        queryParams.append(key, params[key]);
      }
    });

    const response = await api.get(`/authors/list?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error listing authors:", error);
    throw error;
  }
};

export const updateAuthorById = async (authorId, authorData) => {
  try {
    const response = await api.put(`/authors/${authorId}`, authorData);
    return response.data;
  } catch (error) {
    console.error("Error updating author:", error);
    if (error.response?.status === 409) {
      throw new Error("Este email já está sendo usado por outro autor");
    }
    if (error.response?.status === 404) {
      throw new Error("Autor não encontrado");
    }
    throw error;
  }
};

export const deleteAuthorById = async (authorId) => {
  try {
    await api.delete(`/authors/${authorId}`);
  } catch (error) {
    console.error("Error deleting author:", error);
    if (error.response?.status === 404) {
      throw new Error("Autor não encontrado");
    }
    throw error;
  }
};