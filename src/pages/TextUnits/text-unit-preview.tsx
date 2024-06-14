import { useEffect, useMemo } from "react";
import { CreateTextUnitDto } from "../../api/generated";
import { OrderedParsedTextUnit } from "text-parser";

export const TextUnitPreview: React.FC<{
    textUnit: CreateTextUnitDto;
}> = ({ textUnit }) => {

    const parsedOrderedTextUnit = useMemo(() => {
        const order = textUnit.partsOrder?.split(",").map((part) => parseInt(part));
        return new OrderedParsedTextUnit(textUnit.content, order ?? []);
    }, [textUnit]);

    return (
        <div>
            <h3>{textUnit.title}</h3>
            {
                parsedOrderedTextUnit.orderedTextUnitParts.map((part, index) => {
                    return (
                        <div key={index} style={{
                            marginBlock: "1em",
                        }}>
                            {
                                part.lines.map((line, idx) => {
                                    return <p key={index + "_" + idx} style={{ marginBlock: 0 }}>{line}</p>
                                })
                            }
                        </div>
                    );
                })
            }
        </div>
    );
};