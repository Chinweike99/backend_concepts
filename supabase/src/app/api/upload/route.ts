import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// Upload Image
export async  function POST(req: NextRequest){
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File
        if(!file){
            return NextResponse.json({error: "No file provided"}, {status: 400})
        }

        const fileName = `${Date.now()}-${file.name}`;
        const { data, error } = await supabaseAdmin.storage.from('product-images').upload(fileName, file);
        if(error){
            return NextResponse.json({error: error.message}, {status: 400});
        }

        const {data: {publicUrl}} = supabaseAdmin.storage.from('product-images').getPublicUrl(fileName);

        return NextResponse.json({url: publicUrl})

    } catch (error) {
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}


