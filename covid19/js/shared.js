
// Writes text to an svg, with a css class and optional id
export function text(text, svg, style, x, y, id = "") {  

    const textElm = 
        svg.append("text")
            .attr("x", x)
            .attr("y", y)
            .attr("pointer-events", "none")
            .text(text)
            .classed(style, true)

    // Give it an id, if provided    
    if (id != "")
        textElm.attr("id", id);  
        
    return textElm;    
}

// Writes centered text to an svg, but pass in a css class
export function centeredText(text, svg, style, x1, width, y) {
    svg.append("text")
        .attr("x", x1 + (width / 2))
        .attr("y", y)
        .attr("text-anchor", "middle")
        .text(text)
        .classed(style, true);
} 


// Writes right justified text to an svg, but pass in a css class
export function rightText(text, svg, style, x1, width, y) {
    if (text === "NaN")
        return;

    svg.append("text")
        .attr("x", x1 + width)
        .attr("y", y)
        .attr("text-anchor", "end")
        .text(text)
        .classed(style, true);
} 

export function secondsToString(secs) {
    //var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(secs / 3600);
    var minutes = Math.floor((secs - (hours * 3600)) / 60);
    var seconds = secs - (hours * 3600) - (minutes * 60);

    if (minutes < 10) {minutes = "0" + minutes;}
    if (seconds < 10) {seconds = "0" + seconds;}
    
    return hours + ':' + minutes + ':' + seconds;
}
