import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin/auth'
import { createServiceRoleClient } from '@/lib/supabase/service'

export async function GET(
  _req: NextRequest,
  { params }: { params: { essayId: string } }
) {
  const adminUser = await getAdminUser()
  if (!adminUser?.profile || !['admin', 'dev'].includes(adminUser.profile.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { essayId } = params
  const supabase = createServiceRoleClient()

  const { data: essay, error } = await supabase
    .from('essays')
    .select(
      `id, prompt, essay_content, created_at, overall_score,
       task_response_score, coherence_cohesion_score, lexical_resource_score, grammatical_accuracy_score,
       task_response_comment, coherence_cohesion_comment, lexical_resource_comment, grammatical_accuracy_comment,
       task_response_errors, coherence_cohesion_errors, lexical_resource_errors, grammatical_accuracy_errors,
       task_response_strengths, coherence_cohesion_strengths, lexical_resource_strengths, grammatical_accuracy_strengths`
    )
    .eq('id', essayId)
    .single()

  if (error || !essay) {
    return NextResponse.json({ error: 'Essay not found' }, { status: 404 })
  }

  return NextResponse.json({ essay })
}
