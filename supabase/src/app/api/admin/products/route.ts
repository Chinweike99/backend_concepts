import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";


export async function PUT(req: NextRequest) {
    try {
        const {id, ...updateData} = await req.json();
        // console.log("Data: ", ...updateData);

        const {data: product, error} = await supabaseAdmin.from('products').update(updateData).eq('id', id).select().single()

        if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(product);
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
};


export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id')
        if(!id){
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
        };
        const { error} = await supabaseAdmin.from('products').delete().eq('id', id)
        if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({message: "Product successfully deleted"})
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


