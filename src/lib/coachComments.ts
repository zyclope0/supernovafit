import { db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'

export async function updateCoachCommentRead(commentId: string, read: boolean) {
  await updateDoc(doc(db, 'coach_comments', commentId), { read_by_athlete: read })
}


