import React from 'react';
import {fabric} from 'fabric';
import './Board.css';

function narrow(v)
{
    const startColor = [0, 0, 0];
    const middleColor = [255, 0, 0];
    const xColor = [255, 165, 0];
    const endColor = [255, 255, 255];

    if (0 <= v && v < 0.33)
    {
        const r = (v - 0) / 0.33;

        return {start: startColor, end: middleColor, mix: r};
    }
    else if (0.33 <= v && v < 0.66)
    {
        const r = (v - 0.33) / 0.33;

        return {start: middleColor, end: xColor, mix: r};

    }
    else
    {
        const r = (v - 0.66) / 0.33;
        return {start: xColor, end: endColor, mix: r};
    }
}

function getRegion(val)
{
    const colorStopRanges = [0, 0.33, 0.66, 1];
    const colorStopColors = [
        [0, 0, 0],
        [255, 0, 0],
        [255, 165, 0],
        [255, 255, 255],
    ];

    for (var i = 0; i < colorStopRanges.length-1; i += 1)
    {
        const startRange = colorStopRanges[i];
        const stopRange = colorStopRanges[i + 1];

        if (startRange <= val && val <= stopRange)
        {
            const mix = (val - startRange) / (stopRange - startRange);
            return {
                from: colorStopColors[i],
                to: colorStopColors[i+1],
                mix: mix
            };
        }
    }

    throw `gradient index ${val} is outside of color stop ranges`;
}

function mixColors(startColor, endColor, mix)
{
    return [
        startColor[0] * (1 - mix) + endColor[0] * mix,
        startColor[1] * (1 - mix) + endColor[1] * mix,
        startColor[2] * (1 - mix) + endColor[2] * mix,
    ];
}

function getColor(v)
{
    const grad = getRegion(v);
    const resColor = mixColors(grad.from, grad.to, grad.mix);
    return `rgb(${resColor[0]}, ${resColor[1]}, ${resColor[2]})`;
}

class Board extends React.Component
{
    constructor()
    {
        super();
        console.log("Construcror");
    }

    addImage(img)
    {
       img.scale(0.5);
       img.set({left: 16, top: 16});
       this.canvas.add(img);
    }

    componentDidMount()
    {
        const canvas = new fabric.Canvas('board');


        for (var x = 0; x < 500; x += 4)
        {
            const r = new fabric.Rect({
              left: 70 + x,
              top: 100,
              fill: getColor(x/(500-4)),
              width: 4,
              height: 40,
              selectable: false,
            });

            canvas.add(r);
        }

        const gradRect = new fabric.Rect({
              left: 70,
              top: 150,
              fill: 'green',
              width: 500,
              height: 40,
              selectable: false,
        });
        gradRect.setGradient("fill",
        {
          x1: 0,
          y1: 20,
          x2: 500,
          y2: 20,
            colorStops: {
                0: 'rgb(0, 0, 0)',
                0.33: 'rgb(255, 0, 0)',
                0.66: 'rgb(255, 165, 0)',
                1: 'rgb(255, 255, 255)',

            }
          });
        canvas.add(gradRect);
    }

    render()
    {
        return <canvas id="board" className="Board-canavas" width="640" height="480"/>;
    }
}

export default Board;