import * as categoriaModel from '../models/categoria.model.js';

export const create_categoria = async (req, res) => {
  try {
    const statusMessage = await categoriaModel.create_categoria(req.body);
    if (statusMessage === 'Category created successfully') return res.status(201).json({ message: 'Categoría creada exitosamente' });
    else return res.status(400).json({ message: statusMessage });
  } catch (error) {
    res.status(500).json({ message: `Error al crear la categoría: ${error.message}` });
  }
};

export const get_categorias = async (req, res) => {
  try {
    const categorias = await categoriaModel.get_categorias();
    res.status(200).json(categorias);
  } catch (error) {
    res.status(500).json({ message: `Error al obtener categorías: ${error.message}` });
  }
};

export const update_categoria = async (req, res) => {
  try {
    const statusMessage = await categoriaModel.update_categoria(req.params.id, req.body);
    if (statusMessage === 'Category updated successfully') return res.status(200).json({ message: 'Categoría actualizada exitosamente' });
    else return res.status(400).json({ message: statusMessage });
  } catch (error) {
    res.status(500).json({ message: `Error al actualizar la categoría: ${error.message}` });
  }
};

export const delete_categoria = async (req, res) => {
  try {
    const statusMessage = await categoriaModel.delete_categoria(req.params.id);
    if (statusMessage === 'Category deleted successfully') return res.status(200).json({ message: 'Categoría eliminada exitosamente' });
    else return res.status(400).json({ message: statusMessage });
  } catch (error) {
    res.status(500).json({ message: `Error al eliminar la categoría: ${error.message}` });
  }
};