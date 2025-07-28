import { getStudentProgress, updateStudentProgress } from '../../../../backend/api/learning-guide';

export async function GET(request: Request) {
  return getStudentProgress(request as any);
}

export async function PUT(request: Request) {
  return updateStudentProgress(request as any);
}