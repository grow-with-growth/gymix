import { getActivePathwaysWithDetails } from '../../../../../backend/api/learning-guide';

export async function GET(request: Request) {
  return getActivePathwaysWithDetails(request as any);
}