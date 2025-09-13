import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";


export async function GET(){
    try {
        const {data: products, error } = await supabaseAdmin.from('products').select('*').order('created_at', {ascending: false});

        if(error){
            return NextResponse.json({error: error.message}, {status: 400})
        }
        return NextResponse.json(products)
    } catch (error: any) {
        return NextResponse.json({error: error.message}, {status: 500} )
    }
};


export async function POST(request: NextRequest){
    try {
        const body = await request.json();
        const {data: product, error }  = await supabaseAdmin.from('products').insert([body]).select().single();

        if(error) {
            return NextResponse.json({error: error.message}, {status: 400})
        };
        console.log("Products: ",product)
        return NextResponse.json(product, {status: 201})

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}