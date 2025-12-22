import { useState, useRef, useEffect } from 'react';
import { LogoIcon } from './LogoIcon';
import { ActionButton } from './ActionButton';
import { supabase } from '../lib/supabaseClient';

export function Header({ onAddRow, onExport, user, onSave, onOpenGallery, onOpenMyTemplates }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // 1. LÓGICA DE LOGIN (RESTAURADA)
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

  // 2. LÓGICA DE LOGOUT (RESTAURADA)
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false); // Cerramos el menú al salir
  };

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-[#111827]/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-800">
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* LOGO */}
        <div className="flex items-center gap-3">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <LogoIcon className="relative w-10 h-10 shadow-xl text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-100 hidden sm:block font-['Outfit']">
              Anime<span className="text-blue-500">Tier</span>Maker
            </h1>
        </div>

        <div className="flex items-center gap-4">

          {/* ISLA 1: USUARIO (Con Menú Dropdown) */}
          <div className="relative" ref={menuRef}> 
            {user ? (
              <>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-3 bg-gray-800/50 p-1.5 pr-3 rounded-xl border border-gray-700/50 hover:bg-gray-800 transition-colors"
                >
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="Avatar" 
                    className="w-8 h-8 rounded-full ring-2 ring-blue-500/50"
                  />
                  <span className="hidden md:block text-xs font-bold text-gray-300">
                      {user.user_metadata.full_name?.split(' ')[0]}
                  </span>
                  <svg className={`w-3 h-3 text-gray-500 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>

                {/* MENÚ DESPLEGABLE */}
                {isMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-[#1f2937] border border-gray-700 rounded-xl shadow-xl overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 z-50">
                    <button 
                      onClick={() => { setIsMenuOpen(false); onOpenMyTemplates(); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-blue-600 hover:text-white flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>
                      Mis Templates
                    </button>
                    <div className="h-px bg-gray-700 my-1"></div>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* ESTADO: DESCONECTADO (BOTÓN REPARADO) */
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-gray-700"
              >
                <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.013-1.133 8.053-3.24 2.08-2.16 2.72-5.333 2.72-8.227 0-.8-.08-1.48-.24-2.147h-10.533z"/></svg>
                <span>Entrar</span>
              </button>
            )}
          </div>

          {/* ISLA 2: HERRAMIENTAS */}
          <div className="flex items-center gap-2 bg-gray-800/50 p-1.5 rounded-xl border border-gray-700/50 backdrop-blur-sm">
             <ActionButton onClick={onOpenGallery} tooltip="Explorar" icon={<svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>} />
             <div className="w-px h-6 bg-gray-700 mx-1"></div>
             <ActionButton onClick={onSave} tooltip="Guardar" icon={<svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>} />
             <ActionButton onClick={onExport} tooltip="Exportar" icon={<svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>} />
          </div>

        </div>
      </div>
    </header>
  );
}