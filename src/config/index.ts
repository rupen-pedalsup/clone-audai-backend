import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const config = {
    get port() {
        return process.env.PORT || 3000;
    },
    get goolgeApiKey() {
        return process.env.GOOGLE_AI_API_KEY;
    },
};

export default config;
