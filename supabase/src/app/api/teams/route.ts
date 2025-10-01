import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";



export async function GET(){
    try {
        const {data: teams, error} = await supabaseAdmin.from('teams').select('*').order('created_at');
        // const response = await supabaseAdmin.from('teams').select('*');

        if(error){
            throw Error("Error getting teams: ", error)
        }
        NextResponse.json(teams)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
    }
}

