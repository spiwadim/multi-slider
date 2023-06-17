import React, { useEffect, useRef, useState } from "react";
import { useContainerDimensions } from "./dimensionHook";
import "./MultiSlider.css";

export interface SliderSettings {
    overallDuration: number;
}
export interface Block {
    id: string;
    start: number;
    size: number;
    colorClass?: string;
}
interface BlockInt extends Block {
    zIndex?: number;
}
export interface MultiSliderProps {
    settings: SliderSettings;
    data: Block[];
    onMovedBlock: (block: Block) => void
}

const round2 = (n: number) => {
    return Math.round(n * 100) / 100;
}

type MovedPartType = 'start' | 'middle' | 'end';

const MultiSlider = (props: MultiSliderProps) => {
    const componentRef = useRef<HTMLDivElement>(null);
    const { width, left } = useContainerDimensions(componentRef)
    const [blocks, setBlocks] = useState<BlockInt[]>(props.data);
    const movedBlockInt = useRef<BlockInt>();
    let movedPartInt = useRef<MovedPartType>();
    let initialOffsetInt = useRef<number>(0);

    useEffect(() => {
        setBlocks(props.data);
    }, [props.data]);

    const onStartMove = (e: React.MouseEvent, block: BlockInt, part: MovedPartType) => {
        e.stopPropagation();
        e.preventDefault();
        document.body.style.cursor = 'ew-resize';
        movedBlockInt.current = block;
        movedPartInt.current = part;
        initialOffsetInt.current = e.clientX - (e.target as HTMLElement)?.getBoundingClientRect().left;
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('mousemove', onMouseMove);
    }
    const onMouseUp = (e: Event) => {
        e.stopPropagation();
        e.preventDefault();
        document.body.style.cursor = 'default';
        movedBlockInt.current = undefined;
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mousemove', onMouseMove);
        setBlocks((state) => [...state]);
    }
    const onMouseMove = (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (movedBlockInt.current) {
            const newMovedBLock = Object.assign({}, movedBlockInt.current);
            const diffForOtherBlock = newMovedBLock.zIndex === blocks.length ? 0 : 1;
            newMovedBLock.zIndex = blocks.length;
            if (movedPartInt.current === 'middle') {
                const pos = (e.clientX - left - initialOffsetInt.current) / width * props.settings.overallDuration;
                newMovedBLock.start = round2(Math.min(Math.max(0, pos), props.settings.overallDuration - newMovedBLock.size));
            }
            if (movedPartInt.current === 'start') {
                const pos = (e.clientX - left) / width * props.settings.overallDuration;
                const newDelay = Math.min(Math.max(0, pos), newMovedBLock.start + newMovedBLock.size);
                newMovedBLock.size = round2(newMovedBLock.size + (newMovedBLock.start - newDelay));
                newMovedBLock.start = round2(newDelay);
            }
            if (movedPartInt.current === 'end') {
                const pos = (e.clientX - left) / width * props.settings.overallDuration;
                newMovedBLock.size = round2(Math.min(Math.max(0, pos - newMovedBLock.start), props.settings.overallDuration - newMovedBLock.start));
            }
            let newBlocks = blocks.map(b => {
                return b.id === newMovedBLock.id ? newMovedBLock : { ...b, zIndex: b.zIndex ? b.zIndex - diffForOtherBlock : 0 }
            });
            props.onMovedBlock(newMovedBLock);
            setBlocks(newBlocks)
        }
    }
    function getBlockStyle(data: BlockInt) {
        const adjustedStart = Math.min(data.start, props.settings.overallDuration);
        return {
            zIndex: data.zIndex,
            backgroundColor: data.colorClass ? '' : 'grey',
            left: width / props.settings.overallDuration * adjustedStart,
            width: width / props.settings.overallDuration * Math.min(data.size, props.settings.overallDuration - adjustedStart)
        }
    }
    const getHint = () => {
        return blocks.find(b => b.id === movedBlockInt.current?.id)![movedPartInt.current === 'end' ? 'size' : 'start'].toFixed(2);
    }
    return <div className="multi-slider" ref={componentRef}>
        <div className="back-line" draggable="false"></div>
        {blocks.map(d => {
            const main = <div className={'block ' + d.colorClass} key={d.id} style={getBlockStyle(d)} onMouseDown={e => onStartMove(e, d, 'middle')}>
                <div className="start-ancor" draggable="false" onMouseDown={e => onStartMove(e, d, 'start')}></div>
                <div className="end-ancor" draggable="false" onMouseDown={e => onStartMove(e, d, 'end')}></div>
                {movedBlockInt.current?.id === d.id ? <div className={'hint ' + (movedPartInt.current === 'end' ? 'end' : '')}>{getHint()}</div> : <></>}
            </div>;
            return main;
        })}
    </div>
};

export default MultiSlider;