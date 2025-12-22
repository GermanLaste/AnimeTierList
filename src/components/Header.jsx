// src/components/Header.jsx
import { LogoIcon } from './LogoIcon';
import { ActionButton } from './ActionButton';
import { supabase } from '../lib/supabaseClient';

// Agregamos 'user', 'onSave' y 'onOpenGallery' a las props
export function Header({ onAddRow, onReset, onExport, user, onSave, onOpenGallery }) {   
  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-[#111827]/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-800">
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* LOGO Y TÍTULO */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
            <LogoIcon className="relative w-10 h-10 shadow-xl text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-100 hidden sm:block font-['Outfit']">
            Anime<span className="text-blue-500">Tier</span>Maker
          </h1>
        </div>

        {/* ZONA DERECHA: Agrupamos todo */}
        <div className="flex items-center gap-4">

          {/* ISLA 1: USUARIO (Login / Avatar) */}
          <div className="flex items-center bg-gray-800/50 p-1.5 rounded-xl border border-gray-700/50 backdrop-blur-sm">
            {user ? (
              /* ESTADO: CONECTADO */
              <div className="flex items-center gap-3 px-2">
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Avatar" 
                  className="w-6 h-6 rounded-full ring-2 ring-blue-500/50"
                />
                <span className="hidden md:block text-xs font-bold text-gray-300">
                    {user.user_metadata.full_name?.split(' ')[0]}
                </span>
                <button 
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-400 transition-colors"
                  title="Cerrar Sesión"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              </div>
            ) : (
              /* ESTADO: DESCONECTADO */
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.013-1.133 8.053-3.24 2.08-2.16 2.72-5.333 2.72-8.227 0-.8-.08-1.48-.24-2.147h-10.533z"/></svg>
                <span>Entrar</span>
              </button>
            )}
          </div>

          {/* ISLA 2: HERRAMIENTAS */}
          <div className="flex items-center gap-2 bg-gray-800/50 p-1.5 rounded-xl border border-gray-700/50 backdrop-blur-sm">
            
            {/* 1. BOTÓN GALERÍA */}
            <ActionButton 
              onClick={onOpenGallery} 
              tooltip="Explorar Comunidad" 
              icon={
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              } 
            />

            {/* 2. BOTÓN PUBLICAR */}
            <ActionButton 
              onClick={onSave} 
              tooltip="Publicar Template" 
              icon={
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              } 
            />

            <div className="w-px h-6 bg-gray-700 mx-1"></div>

            {/* 3. HERRAMIENTAS LOCALES */}
            <ActionButton 
              onClick={onAddRow} 
              tooltip="Añadir Tier" 
              hideOnExport={true} 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>} 
            />
            
            <div className="w-px h-6 bg-gray-700 mx-1"></div>
            
            <ActionButton 
              onClick={onReset} 
              danger={true} 
              tooltip="Reset Total" 
              hideOnExport={true} 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>} 
            />
            
            <ActionButton 
              onClick={onExport} 
              tooltip="Exportar Imagen" 
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>} 
            />
          </div>
        </div>
      </div>
    </header>
  );
}