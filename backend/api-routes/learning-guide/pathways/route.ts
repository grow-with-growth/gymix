import { getStudentPathways } from '../../../../backend/api/learning-guide';

export async function GET(request: Request) {
  return getStudentPathways(request as any);
}