module.exports = {
    strcmp : function(str1, str2) {
        var new_str1 = str1.toUpperCase();
        var new_str2 = str2.toUpperCase();
        return ( ( str1 == str2 ) ? 0 : ( ( str1 > str2 ) ? 1 : -1 ) );
    },

    indexStep : function(index, factor) {
        return (index + 1) % factor === 0 ? true : false;
    }
}