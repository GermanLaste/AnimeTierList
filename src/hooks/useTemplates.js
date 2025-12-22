import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useTemplates() {
  const [loading, setLoading] = useState(false);

  // 1. PUBLICAR (Guardar nuevo template)
  const publishTemplate = async ({ title, description, items, user }) => {
    setLoading(true);
    try {
        if (!user) throw new Error("Debes iniciar sesión para publicar.");
        if (!title.trim()) throw new Error("El título es obligatorio.");
        if (items.length === 0) throw new Error("La lista está vacía.");

        // Guardar la cabecera
        // 1. Guardar la "Carpeta" (El Template) con la firma del autor
        const { data: template, error: tError } = await supabase
            .from('tier_templates')
            .insert([{ 
                title, 
                description, 
                user_id: user.id,
                is_public: true,
                // --- NUEVO: Guardamos la firma del autor ---
                author_name: user.user_metadata.full_name?.split(' ')[0] || 'Anónimo',
                author_avatar: user.user_metadata.avatar_url
            }])
            .select()
            .single();
            
        if (tError) throw tError;

        // Guardar los items
        const templateItems = items.map((anime, index) => ({
            template_id: template.id,
            anime_data: anime,
            position: index
        }));

        const { error: iError } = await supabase
            .from('template_items')
            .insert(templateItems);
            
        if (iError) throw iError;

        return { success: true };

    } catch (error) {
        console.error(error);
        return { success: false, error };
    } finally {
        setLoading(false);
    }
  };

  // 2. LEER (Búsqueda inteligente)
  const getTemplates = async ({ search = '', userId = null } = {}) => {
    setLoading(true);
    try {
      let query = supabase
        .from('tier_templates')
        .select(`
          *,
          template_items (
            anime_data,
            position
          )
        `)
        .order('created_at', { ascending: false });

      // Si nos pasan un ID de usuario, filtramos solo sus templates
      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        // Si es la comunidad, limitamos a 50 para no explotar
        query = query.limit(50);
      }

      // Si hay texto de búsqueda, buscamos en título O autor
      if (search.trim()) {
        const term = `%${search}%`; // Los % son comodines
        query = query.or(`title.ilike.${term},author_name.ilike.${term}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;

    } catch (error) {
      console.error("Error cargando templates:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // ¡No olvides cambiar el return final!
  return { 
      publishTemplate, 
      getTemplates, // <--- Ahora exportamos esta función genérica
      loading 
  };   };