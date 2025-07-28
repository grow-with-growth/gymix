import { submitLearningStyleAssessment } from '../../../../backend/api/learning-guide';

export async function POST(request: Request) {
  return submitLearningStyleAssessment(request as any);
}