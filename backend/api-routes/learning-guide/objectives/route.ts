import { getLearningObjectives } from '../../../../backend/api/learning-guide';

export async function GET(request: Request) {
  return getLearningObjectives(request as any);
}