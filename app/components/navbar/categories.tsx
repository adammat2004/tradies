'use client'
import Container from "../container";
import { MdPlumbing } from "react-icons/md";
import { MdOutlineCarpenter } from "react-icons/md";
import { MdOutlineElectricalServices } from "react-icons/md";
import { GiHighGrass } from "react-icons/gi";
import { GiBrickWall } from "react-icons/gi";
import { BsBricks } from "react-icons/bs";
import { CiDeliveryTruck } from "react-icons/ci";
import { GiPaintRoller } from "react-icons/gi";
import { MdRoofing } from "react-icons/md";
import CategoryBox from "../categoryBox";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export const categories = [
    {
        label: 'Plumber',
        icon: MdPlumbing,
        description: "Plumbing company"
    },
    {
        label: 'Carpenter',
        icon: MdOutlineCarpenter,
        description: "Carpentry company"
    },
    {
        label: 'Electrician',
        icon: MdOutlineElectricalServices,
        description: "Electrical services company"
    },
    {
        label: 'Landscaping',
        icon: GiHighGrass,
        description: "Landscaping company"
    },
    {
        label: 'Paving',
        icon: BsBricks,
        description: "Paving company"
    },
    {
        label: 'Bricklayer',
        icon: GiBrickWall,
        description: "Bricklaying company"
    },
    {
        label: 'Haulage',
        icon: CiDeliveryTruck,
        description: "Haulage company"
    },
    {
        label: 'Painter',
        icon: GiPaintRoller,
        description: "Painting company"
    },
    {
        label: 'Roofer',
        icon: MdRoofing,
        description: "Roofing company"
    },
]

const Categories = () => {
    const params = useSearchParams();
    const category = params?.get('category');
    const pathname = usePathname();

    const isMainPage = pathname == '/';
    if(!isMainPage){
        return null;
    }

    return (
        <Container>
            <div className="pt-4 flex flex-row items-center justify-between overflow-x-auto">
                {categories.map((item) => (
                    <CategoryBox
                        key={item.label}
                        label={item.label}
                        selected={category == item.label}
                        icon={item.icon}
                    />
                ))}
            </div>
        </Container>
    )
}

export default Categories;