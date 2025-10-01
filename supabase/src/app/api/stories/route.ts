import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";


export async function GET(){
    try {
        const {data: stories, error} = await supabaseAdmin.from('client_stories').select('*').eq('is_published', true).order('created_at', {ascending: false})

        if(error){
            throw Error("Error: ", error)
        }
        return NextResponse.json(stories)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 })
    }
}