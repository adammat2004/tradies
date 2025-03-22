import prisma from '@/app/libs/prismadb';
import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';

export async function POST(req: Request) {
    try {
        const {
            category,
            jobTitle,
            companyName,
            location,
            salary,
            jobType,
            requirements,
            description,
            benefits,
            contactInfo,
            listingId
        } = await req.json();
        console.log("listingID", listingId);
        console.log("jobTitle", jobTitle);
        if(!category || !jobTitle || !companyName || !location || !jobType || !requirements || !description || !contactInfo){
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = currentUser.id;

        const newJob = await prisma.job.create({
            data: {
                category,
                jobTitle,
                companyName,
                location,
                salary,
                jobType,
                requirements,
                description,
                benefits,
                contactInfo,
                userId: userId,
                listingId: listingId
            }
        });

        return NextResponse.json({ data: newJob }, { status: 200 });
    } catch (error) {
        console.error("Error creating job:", error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
