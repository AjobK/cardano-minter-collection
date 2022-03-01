
// [Elomin] This is not pretty but it does the job well
module.exports.convert_string_to_hex = (str) =>
    str                                 // The given string
    .split('')                          // Splits the string into a character array
    .map(i =>                           // Goes over each 'character'
        i.charCodeAt(0).toString(16)    // Takes the UTF8 character code and converts it to hexadecimal (4 bit positions)
    )
    .join('')                           // Glues all the converted (UTF8 to HEX) characters together into a single string