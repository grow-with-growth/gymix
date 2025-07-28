import { getLearningRecommendations } from '../../../../backend/api/learning-guide';

export async function GET(request: Request) {
  return getLearningRecommendations(request as any);
}