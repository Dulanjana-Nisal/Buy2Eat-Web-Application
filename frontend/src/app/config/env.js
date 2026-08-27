const API_BASE_URL = import.meta.env.VITE_API_URL;
const CLIENT_URL = import.meta.env.VITE_CLIENT_URL;

if(!API_BASE_URL){
    throw new Error('VITE_API_URL is required!')
}

export const env = {
    API_BASE_URL,
    CLIENT_URL,
};