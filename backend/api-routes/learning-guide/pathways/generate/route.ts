import { generateLearningPathway } from '../../../../../backend/api/learning-guide';

export async function POST(request: Request) {
  return generateLearningPathway(request as any);
}