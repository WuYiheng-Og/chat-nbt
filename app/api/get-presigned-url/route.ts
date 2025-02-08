import { NextRequest, NextResponse } from 'next/server'; 
import OSS from 'ali-oss'; 

// 使用预签名 URL,因为客户端无法直接访问环境变量，为了安全起见。 
// 创建阿里云客户端
const aliClient = new OSS({
    region: process.env.ALI_OSS_REGION,
    accessKeyId: process.env.ALI_OSS_ACCESS_KEY_ID!,
    accessKeySecret: process.env.ALI_OSS_ACCESS_KEY_SECRET!,
    bucket: process.env.ALI_OSS_BUCKET
})

// 这里bucket存储的资源是私有的，公有要钱，只能这样曲线救国
export async function GET(req: NextRequest)  {

    // 获取路径携带参数
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (typeof key!== 'string') {
        return new NextResponse('Invalid key', { status: 400 }); 
    }
    const url = await aliClient.signatureUrl(`attachments/${key}`,{
        expires: 3600 // URL有效1h
    });
    if(url) {
        // console.log(url);
        // 使用构造函数返回纯文本响应
        return new NextResponse(url, { status: 200 }); 
    } else {
        return new NextResponse('Error generating presigned URL', { status: 500 });
    }

}