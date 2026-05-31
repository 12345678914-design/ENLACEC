import { supabase } from './auth.js';
import { prepararVistaPassword } from './auth.js';

// --- 1. LÓGICA DE COMPONENTES ---

async function cargarComponente(id, archivo) {
    try {
        const respuesta = await fetch(archivo);
        if (!respuesta.ok) throw new Error(`Error al cargar ${archivo}`);
        const html = await respuesta.text();
        document.getElementById(id).innerHTML = html;
    } catch (error) {
        console.error("Error al cargar componente:", error);
    }
}

export async function inicializarLayout() {
    // Cargamos Sidebar y Header
    await Promise.all([
        cargarComponente('sidebar-placeholder', 'components/sidebar.html'),
        cargarComponente('header-placeholder', 'components/header.html')
    ]);

    // Asignar evento al botón salir (asegurando que exista)
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', cerrarSesionApp);
    }
}

async function cerrarSesionApp() {
    await supabase.auth.signOut();
    window.location.reload();
}

// --- 2. LÓGICA DE VISTAS Y NAVEGACIÓN ---

export function mostrarVista(idVista) {
    const vistas = document.querySelectorAll('.view');
    vistas.forEach(v => v.style.display = 'none');
    
    const vistaActiva = document.getElementById(idVista);
    if (!vistaActiva) return;

    // Ajuste de display según la vista
    vistaActiva.style.display = (idVista === 'home-view') ? 'block' : 'flex';
    vistaActiva.style.opacity = '0';
    
    requestAnimationFrame(() => {
        vistaActiva.style.opacity = '1';
    });

    // Ejecutar lógica según vista
    if (idVista === 'password-view') {
        prepararVistaPassword();
    } else if (idVista === 'home-view') {
        inicializarLayout().then(() => cargarNoticiasInicio());
    }
}

// --- 3. LÓGICA DE DATOS ---

export async function cargarNoticiasInicio() {
    const newsGrid = document.getElementById('news-grid');
    if (!newsGrid) return;

    const { data, error } = await supabase
        .from('eventos_noticias')
        .select('*')
        .limit(5);

    if (error) return;

    newsGrid.innerHTML = data.map(item => `
        <div class="news-card" onclick="verNoticiaCompleta('${item.id}')">
            <img src="${item.url_foto}" style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover;">
            <div>
                <h3 style="margin:0;">${item.titulo}</h3>
                <p style="color: #64748b; margin: 5px 0 0;">${item.descripcion.substring(0, 60)}...</p>
            </div>
        </div>
    `).join('');
}

// Función global para manejar el click
window.verNoticiaCompleta = (id) => {
    alert("Abriendo detalle de la noticia: " + id);
    // Aquí puedes redirigir o mostrar un modal
};

// --- 4. INICIALIZACIÓN ---

async function verificarSesion() {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        window.sessionData = { telefono: session.user.phone, siPass: true };
        mostrarVista('home-view');
    } else {
        mostrarVista('login-view');
    }
}

window.addEventListener('DOMContentLoaded', verificarSesion);