import { neon } from "@neondatabase/serverless";
import {validSession,json} from "../../_lib/auth.js";

const database=(env)=>env.DATABASE_URL ? neon(env.DATABASE_URL) : null;

export async function onRequestGet({request,env}) {
  if(!await validSession(request,env.COMMENTS_SESSION_SECRET)) return json({error:"Please sign in as an administrator."},401);
  const sql=database(env);
  if(!sql) return json({error:"Comments database is not configured."},503);
  try {
    const comments=await sql`SELECT id,name,role,comment,status,created_at FROM comments WHERE status != 'approved' ORDER BY created_at DESC LIMIT 300`;
    return json({comments});
  } catch {
    return json({error:"Could not load moderation queue."},500);
  }
}

export async function onRequestPatch({request,env}) {
  if(!await validSession(request,env.COMMENTS_SESSION_SECRET)) return json({error:"Please sign in as an administrator."},401);
  const sql=database(env);
  if(!sql) return json({error:"Comments database is not configured."},503);
  let data;
  try { data=await request.json(); } catch { return json({error:"Invalid request."},400); }
  const id=Number(data.id),status=String(data.status||"");
  if(!Number.isSafeInteger(id)||id<1||!["approved","rejected","pending"].includes(status)) return json({error:"Invalid comment action."},400);
  try {
    const result=await sql`UPDATE comments SET status=${status} WHERE id=${id} RETURNING id`;
    if(!result.length) return json({error:"Comment not found."},404);
    return json({ok:true});
  } catch {
    return json({error:"Could not update comment."},500);
  }
}
