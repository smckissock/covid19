


// https://bl.ocks.org/Lulkafe/c77a36d5efb603e788b03eb749a4a714
export function d3CheckBox(checkBoxName) {

    let theName = checkBoxName,
        size = 20,
        x = 0,
        y = 0,
        rx = 0,
        ry = 0,
        markStrokeWidth = 1,
        boxStrokeWidth = 3,
        checked = false,
        mark = null,
        clickEvent;

    function checkBox(selection) {

        const g = selection.append("g");

        // Checkmark
        const coordinates = [
            { x: x + (size / 4), y: y + (size / 2) },
            { x: x + (size / 2.2), y: (y + size) - (size / 3.5) },
            { x: (x + size) - (size / 4), y: (y + (size / 4)) }
        ];

        const line = d3.line()
            .x(function (d) { return d.x; })
            .y(function (d) { return d.y; })

        mark = g.append("path")
            .attr("d", line(coordinates))
            .style("stroke-width", markStrokeWidth)
            .style("stroke-linecap", "round")

            .style("fill", "none")
            .style("opacity", 1)
            .style("stroke", (checked) ? "black" : "darkgrey")

            .attr("pointer-events", "none");

        g.on("click", function () {
            checked = !checked;
            //mark.style("opacity", (checked)? 1 : 0);

            mark
                .style("stroke", (checked) ? "black" : "lightgrey")

            /* mark
                .transition()
                .duration(100)
                .style("stroke", (checked)? "black" : "lightgrey") */

            if (clickEvent)
                clickEvent();

            d3.event.stopPropagation();
        });

        const box = g.append("rect")
            .attr("width", size)
            .attr("height", size)
            .attr("x", x)
            .attr("y", y)
            .attr("rx", rx)
            .attr("ry", ry)
            .style("fill-opacity", 0)
            .style("stroke-width", boxStrokeWidth)
            .style("stroke", "black")
            .on("mouseover", function () {
                d3.select(this)
                    .transition()
                    .duration(20)
                    .style("stroke-width", boxStrokeWidth + 3)

                d3.event.stopPropagation();
            })
            .on("mouseout", function () {
                d3.select(this)
                    .transition()
                    .duration(50)
                    .style("stroke-width", boxStrokeWidth)

                d3.event.stopPropagation();
            });
    }


    // "theName" because you cannot reassign the "name" value of a function
    checkBox.getName = function () {
        return theName;
    }

    checkBox.size = function (val) {
        size = val;
        return checkBox;
    }

    checkBox.x = function (val) {
        x = val;
        return checkBox;
    }

    checkBox.y = function (val) {
        y = val;
        return checkBox;
    }

    checkBox.rx = function (val) {
        rx = val;
        return checkBox;
    }

    checkBox.ry = function (val) {
        ry = val;
        return checkBox;
    }

    checkBox.markStrokeWidth = function (val) {
        markStrokeWidth = val;
        return checkBox;
    }

    checkBox.boxStrokeWidth = function (val) {
        boxStrokeWidth = val;
        return checkBox;
    }

    checkBox.checked = function (val) {

        if (val === undefined) {
            return checked;
        } else {
            checked = val;
            if (mark) {
                mark
                    .transition()
                    .duration(100)
                    .style("stroke", (mark.checked) ? "black" : "darkgrey")
            }
            return checkBox;
        }
    }

    checkBox.mark = function () {

    }

    checkBox.clickEvent = function (val) {
        clickEvent = val;
        return checkBox;
    }

    return checkBox;
}