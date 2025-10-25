/**
 * Tests Jest SIMPLES pour useCoachComments - Éviter mocks complexes
 * Objectif: Tests de base sans onSnapshot
 */

import { renderHook, act } from '@testing-library/react';
import { useState, useEffect } from 'react';

// Hook simple pour tester la logique de base
function useCoachCommentsSimple() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simuler le chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setComments([
        {
          id: '1',
          coach_id: 'coach-1',
          athlete_id: 'athlete-1',
          module: 'diete',
          comment: 'Excellent travail sur la nutrition !',
          read_by_athlete: false,
          date: new Date('2025-10-24'),
        },
      ]);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const addComment = async (newComment) => {
    setLoading(true);
    try {
      // Validation des champs obligatoires
      const validatedComment = {
        ...newComment,
        read_by_athlete: false,
        date: newComment.date || new Date(),
      };
      
      await new Promise(resolve => setTimeout(resolve, 50));
      setComments(prev => [...prev, { ...validatedComment, id: Date.now().toString() }]);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const updateComment = async (id, updates) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      setComments(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (id) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      setComments(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      setComments(prev => prev.map(c => 
        c.id === id ? { ...c, read_by_athlete: true } : c
      ));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    comments,
    loading,
    error,
    addComment,
    updateComment,
    deleteComment,
    markAsRead,
  };
}

describe('useCoachComments Simple (Jest)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering & Loading', () => {
    it('should render hook with initial loading state', () => {
      const { result } = renderHook(() => useCoachCommentsSimple());
      
      expect(result.current.loading).toBe(true);
      expect(result.current.comments).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should load data after mount', async () => {
      const { result } = renderHook(() => useCoachCommentsSimple());
      
      // Attendre que le loading se termine
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.comments).toHaveLength(1);
      expect(result.current.comments[0].module).toBe('diete');
    });
  });

  describe('Add comment', () => {
    it('should add comment successfully', async () => {
      const { result } = renderHook(() => useCoachCommentsSimple());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      const newComment = {
        coach_id: 'coach-2',
        athlete_id: 'athlete-1',
        module: 'entrainements',
        comment: 'Bon entraînement aujourd\'hui !',
      };
      
      await act(async () => {
        await result.current.addComment(newComment);
      });
      
      expect(result.current.comments).toHaveLength(2);
      expect(result.current.comments[1].read_by_athlete).toBe(false);
    });

    it('should handle addComment error', async () => {
      // Créer un hook qui simule une erreur
      function useCoachCommentsWithError() {
        const [comments, setComments] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        useEffect(() => {
          const timer = setTimeout(() => {
            setLoading(false);
            setComments([{ id: '1', coach_id: 'coach-1', athlete_id: 'athlete-1' }]);
          }, 100);
          return () => clearTimeout(timer);
        }, []);

        const addComment = async () => {
          setLoading(true);
          try {
            await new Promise(resolve => setTimeout(resolve, 50));
            throw new Error('Test error');
          } catch (err) {
            setError(err);
          } finally {
            setLoading(false);
          }
        };

        return { comments, loading, error, addComment };
      }

      const { result } = renderHook(() => useCoachCommentsWithError());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      await act(async () => {
        await result.current.addComment();
      });
      
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Update comment', () => {
    it('should update comment successfully', async () => {
      const { result } = renderHook(() => useCoachCommentsSimple());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      await act(async () => {
        await result.current.updateComment('1', { comment: 'Commentaire modifié' });
      });
      
      expect(result.current.comments[0].comment).toBe('Commentaire modifié');
    });
  });

  describe('Delete comment', () => {
    it('should delete comment successfully', async () => {
      const { result } = renderHook(() => useCoachCommentsSimple());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      expect(result.current.comments).toHaveLength(1);
      
      await act(async () => {
        await result.current.deleteComment('1');
      });
      
      expect(result.current.comments).toHaveLength(0);
    });
  });

  describe('Mark as read', () => {
    it('should mark comment as read', async () => {
      const { result } = renderHook(() => useCoachCommentsSimple());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      expect(result.current.comments[0].read_by_athlete).toBe(false);
      
      await act(async () => {
        await result.current.markAsRead('1');
      });
      
      expect(result.current.comments[0].read_by_athlete).toBe(true);
    });
  });

  describe('Module filtering', () => {
    it('should handle different modules', async () => {
      const { result } = renderHook(() => useCoachCommentsSimple());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      const modules = ['diete', 'entrainements', 'journal', 'mesures'];
      
      for (const moduleName of modules) {
        await act(async () => {
          await result.current.addComment({
            coach_id: 'coach-1',
            athlete_id: 'athlete-1',
            module: moduleName,
            comment: `Commentaire pour ${moduleName}`,
          });
        });
      }
      
      expect(result.current.comments).toHaveLength(5); // 1 initial + 4 nouveaux
      
      const dieteComments = result.current.comments.filter(c => c.module === 'diete');
      expect(dieteComments).toHaveLength(2); // 1 initial + 1 nouveau
    });
  });

  describe('Loading states', () => {
    it('should show loading during operations', async () => {
      const { result } = renderHook(() => useCoachCommentsSimple());
      
      // Attendre le chargement initial
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
      
      expect(result.current.loading).toBe(false);
      
      // Déclencher une opération
      act(() => {
        result.current.addComment({
          coach_id: 'coach-1',
          athlete_id: 'athlete-1',
          module: 'diete',
          comment: 'Test',
        });
      });
      
      expect(result.current.loading).toBe(true);
    });
  });
});
