const pagination = async (total_schema, schema, page) => {

    // create pagination data object
    const paginationData = {
        total_items: total_schema.length || "N/A",
        total_pages: Math.ceil(Number(total_schema.length/schema.length)) || "N/A",
        current_page: page || "N/A",
        page_size: schema.length || "N/A",
    }

    return paginationData;
}

module.exports = pagination;