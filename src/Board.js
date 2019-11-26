import React from 'react';
import {fabric} from 'fabric';
import './Board.css';


class Gradient
{
    constructor(colorStops)
    {
        /*
         * arrange color stops as a:
         *  - indexRanges: list of ranges, sorted in ascending order
         *  - colors: the matching colors for the ranges
         */
        this.indexRanges = Object.keys(colorStops).map(parseFloat).sort();
        this.colors = []
        for (var i = 0; i < this.indexRanges.length; i += 1)
        {
            const range = this.indexRanges[i];
            this.colors.push(colorStops[range]);
        }
    }

    getRegion(val)
    {
        for (var i = 0; i < this.indexRanges.length-1; i += 1)
        {
            const startRange = this.indexRanges[i];
            const stopRange = this.indexRanges[i + 1];

            if (startRange <= val && val <= stopRange)
            {
                const mix = (val - startRange) / (stopRange - startRange);
                return {
                    from: this.colors[i],
                    to: this.colors[i+1],
                    mix: mix
                };
            }
        }

        throw `gradient index ${val} is outside of color stop ranges`;
    }

    mixColors(fromColor, toColor, mix)
    {
        const from = fromColor.getSource();
        const to = toColor.getSource();

        /*
         * perform naive mixing of the two colors,
         * even if it not 100% correct, it's probably good enough
         * for coloring the heat map
         */

        return [
            from[0] * (1 - mix) + to[0] * mix,
            from[1] * (1 - mix) + to[1] * mix,
            from[2] * (1 - mix) + to[2] * mix,
        ];
    }

    getColor(v)
    {
        const grad = this.getRegion(v);
        const resColor = this.mixColors(grad.from, grad.to, grad.mix);
        return `rgb(${resColor[0]}, ${resColor[1]}, ${resColor[2]})`;
    }
}

const WIDTH = 18;
const HEIGHT = 10;

class Heatmap
{
    constructor(results, gradient)
    {
        this.gradient = gradient;
        this.results = results;

        const someResult = Object.keys(results)[0]
        this.minVal = results[someResult];
        this.maxVal = results[someResult];

        for (let cell in results)
        {
            const cellResult = results[cell];
            if (this.minVal > cellResult)
            {
                this.minVal = cellResult;
            }
            if (this.maxVal < cellResult)
            {
                this.maxVal = cellResult;
            }
        }

        this.resultsRange = this.maxVal - this.minVal;

        console.log(this);
    }

    getCellColor(cellNum)
    {
        if (!(cellNum in this.results))
        {
            return "pink";
        }

        const cellResult = this.results[cellNum];

        const scaledResult = (cellResult - this.minVal) / this.resultsRange;

        return this.gradient.getColor(scaledResult);
    }

    addToCanavas(canvas)
    {
        for (var x = 0; x < WIDTH; x += 1)
        {
            for (var y = 0; y < HEIGHT; y += 1)
            {
                const cellNum = x * HEIGHT + y;

                const r = new fabric.Rect({
                    left: 100 + x * 20,
                    top: 200 + y * 20,
                    fill: this.getCellColor(cellNum),
                    width: 18,
                    height: 18,
                    selectable: false,
                });

            canvas.add(r);

            }
        }
    }
}

class Board extends React.Component
{
    constructor()
    {
        super();

        this.gradient = new Gradient({
                0: new fabric.Color("black"),
                0.33: new fabric.Color("red"),
                0.66: new fabric.Color("orange"),
                1: new fabric.Color("white")
        });

        this.heatmap = new Heatmap(
            {"0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5,
             "10": 20, "11": 22, "12": 23, "13": 20, "14": 4, "15": 5},
            this.gradient);
    }

    componentDidMount()
    {
        const canvas = new fabric.Canvas('board');

        for (var x = 0; x < 500; x += 4)
        {
            const r = new fabric.Rect({
              left: 70 + x,
              top: 100,
              fill: this.gradient.getColor(x/(500-4)),
              width: 4,
              height: 40,
              selectable: false,
            });

            canvas.add(r);
        }

        const gradRect = new fabric.Rect({
              left: 70,
              top: 150,
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

        this.heatmap.addToCanavas(canvas);
    }

    render()
    {
        return <canvas id="board" className="Board-canavas" width="640" height="480"/>;
    }
}

export default Board;