
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config.js'; 

const fullConfig = resolveConfig(tailwindConfig);

const colors = fullConfig.theme.colors;

export default colors;