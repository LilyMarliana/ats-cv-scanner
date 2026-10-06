import express from 'express';
import cors from 'cors';
import type { Request, Response } from 'express';
import cvRoutes from './routes/cv.routes';
import jdRoutes from './routes/jd.routes';
import matcherRoutes from './routes/matcher.routes';
import templateRoutes from './routes/template.routes';
import historyRoutes from './routes/history.routes';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('CV ATS Scanner API is running!');
});

app.use('/api/cv', cvRoutes);
app.use('/api/jd', jdRoutes);
app.use('/api/match', matcherRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/history', historyRoutes);

app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});