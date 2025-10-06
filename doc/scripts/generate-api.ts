import { generateFiles } from 'fumadocs-openapi';

void generateFiles({
  input: ['./public/swagger.json'],
  output: './content/docs/api',
  per: 'operation',
  groupBy: 'tag',
  frontmatter: (title, description) => ({
    title,
    description,
    full: true,
  }),
});