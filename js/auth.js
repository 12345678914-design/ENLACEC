import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { mostrarVista } from './main.js';
import { inicializarLayout } from './main.js';


// 1. Inicialización
const SUPABASE_URL = 'https://ikvxleiedmvpujxwiwqr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tgGV84FCONxMGg4QX6BLSQ_tF54tjQ4';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Elementos DOM
const telInput = document.getElementById('telefono-input');
const btnLogin = document.getElementById('btn-login');
const btnText = document.getElementById('btn-text');
const btnLoader = document.getElementById('btn-loader');

// 3. Validación en tiempo real
telInput.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, ''); 
    if (val.length > 9) val = val.substring(0, 9);
    e.target.value = val;

    const esValido = val.length === 9 && val.startsWith('9');
    btnLogin.disabled = !esValido;
});

// 4. Lógica de Login
btnLogin.addEventListener('click', async () => {
    const telefono = telInput.value.trim();

    // UI Loading ON
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';
    btnLogin.disabled = true;

    try {
        // Consultar usuario
        const { data, error } = await supabase
            .from('usuarios')
            .select('si_pass, codigo')
            .eq('telefono', telefono)
            .maybeSingle();

        if (error) throw error;
        if (!data) {
            alert('Usuario no encontrado');
            return;
        }

        // Guardar estado para la siguiente pantalla
        window.sessionData = { telefono, siPass: data.si_pass, codigo: data.codigo };
        
        // Cambiar vista
        mostrarVista('password-view');
        
    } catch (e) {
        console.error(e);
        alert('Error al conectar con la base de datos ' + e.toString());
    } finally {
        // UI Loading OFF
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
        btnLogin.disabled = false;
    }
});
// Lógica de la pantalla de password
const btnContinuarPass = document.getElementById('btn-continuar-pass');
const passInput = document.getElementById('password-input');

// Esta función se activará cuando entres a la vista de password
export function prepararVistaPassword() {
    const { siPass } = window.sessionData;
    
    // Cambiar UI según si es nueva clave o inicio de sesión
    document.getElementById('title-pass').innerText = siPass ? 'Ingresa tu contraseña' : 'Crea tu contraseña';
    document.getElementById('icon-pass').innerText = siPass ? '🔒' : '🔓';
    document.getElementById('btn-text-pass').innerText = siPass ? 'Ingresar' : 'Guardar contraseña';
}

btnContinuarPass.addEventListener('click', async () => {
    const password = passInput.value.trim();
    if (password.length < 4) {
        alert('La contraseña debe tener al menos 4 caracteres');
        return;
    }
    
    // Aquí iría tu lógica de:
    // Si siPass es true -> hacer el SELECT para verificar password
    // Si siPass es false -> hacer el UPDATE en la tabla usuarios con la nueva password
    console.log('Validando password:', password, 'para el usuario:', window.sessionData.telefono);
});
/* Archivo: js/auth.js */

// ... (resto de tu código anterior)

btnContinuarPass.addEventListener('click', async () => {
    const password = passInput.value.trim();
    const { telefono, siPass } = window.sessionData;

    if (password.length < 4) {
        alert('Mínimo 4 caracteres');
        return;
    }

    // UI Loading
    document.getElementById('btn-text-pass').style.display = 'none';
    document.getElementById('btn-loader-pass').style.display = 'block';
    btnContinuarPass.disabled = true;
    // Dentro de tu evento click de validación de contraseña:
const { data, error } = await supabase.auth.signInWithPassword({
    phone: telefono,
    password: password
});

if (!error) {
    // Si el login es exitoso, Supabase guarda la sesión automáticamente
    mostrarVista('home-view');
}

    try {
        if (siPass) {
            // Caso 1: Verificar contraseña existente
            const { data, error } = await supabase
                .from('usuarios')
                .select('id')
                .eq('telefono', telefono)
                .eq('password', password) // Ajusta 'password' al nombre de tu columna en Supabase
                .maybeSingle();

            if (error) throw error;
            if (data) {
                // Aquí rediriges a tu Dashboard o pantalla principal
                await irAlDashboard();
            } else {
                alert('Contraseña incorrecta');
            }
        } else {
            // Caso 2: Guardar contraseña nueva
            const { error } = await supabase
                .from('usuarios')
                .update({ password: password, si_pass: true })
                .eq('telefono', telefono);

            if (error) throw error;
            alert('Contraseña guardada con éxito');
            // Redirigir al Dashboard
        }
    } catch (e) {
        console.error(e);
        alert('Error en la autenticación ' + e.toString());
    } finally {
        document.getElementById('btn-text-pass').style.display = 'block';
        document.getElementById('btn-loader-pass').style.display = 'none';
        btnContinuarPass.disabled = false;
    }
});
async function irAlDashboard() {
    await inicializarLayout(); // Carga componentes (sidebar/header)
    mostrarVista('home-view'); // Cambia a la vista del menú
}
