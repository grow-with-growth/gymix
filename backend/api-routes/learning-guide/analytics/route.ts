import { getLearningAnalytics } from '../../../../backend/api/learning-guide';

export async function GET(request: Request) {
  return getLearningAnalytics(request as any);
}