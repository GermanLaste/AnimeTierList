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
        const { data: template, error: tError } = await supabase
            .from('tier_templates')
            .insert([{ 
                title, 
                description, 
                user_id: user.id,
                is_public: true 
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

  // 2. LEER (Obtener templates recientes) - ¡Esta era la que faltaba!
  const getRecentTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tier_templates')
        .select(`
          *,
          template_items (
            anime_data,
            position
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;

    } catch (error) {
      console.error("Error cargando templates:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { 
      publishTemplate, 
      getRecentTemplates, // <--- ¡Asegúrate de que esta línea esté aquí!
      loading 
  };
}