// config.js
// Configuración de EmailJS y URL base del Backend API para Tienda 3V.
const ES_ENTORNO_LOCAL = !window.location.hostname
  || window.location.hostname === "localhost"
  || window.location.hostname === "127.0.0.1";

const CONFIG = {
  API_BASE_URL: ES_ENTORNO_LOCAL ? "http://localhost:8080/api" : `${window.location.origin}/api`,
  EMAILJS_PUBLIC_KEY: "HCyS-zOR6QNA-SEGq",
  EMAILJS_SERVICE_ID: "@Pollitosenfuga3",
  EMAILJS_TEMPLATE_ID: "template_jmwr41b"
};
