module.exports = {
    strcmp : function(str1, str2) {
        if (typeof str1 !== undefined && str1 && typeof str2 !== undefined && str2){
            var new_str1 = str1.toUpperCase();
            var new_str2 = str2.toUpperCase();
            return ( ( str1 == str2 ) ? 0 : ( ( str1 > str2 ) ? 1 : -1 ) );
        } else {
            return null;
        }
    },

    indexStep : function(index, factor) {
        return (index + 1) % factor === 0 ? true : false;
    },

    years : function(time){
        return (Math.floor((Date.now() - Date.parse(time)) / 31540000000));
    } 
}