# ChainBase - a fast version controlled database 

  ChainBase is designed to meet the demanding requirments of blockchain applications, but is suitable for use
  in any application that requires a robust transactional database with the ability have near-infinate levels of undo
  history.

## Features 

  - Supports multiple objects (tables) with multiple indicies (based upon boost::multi_index_container)
  - State is persistant and sharable among multiple processes 
  - Nested Transactional Writes with ability to undo changes

## Dependencies 
  
  - c++11 
  - [Boost](http://www.boost.org/) 
  - Supports Linux, Mac OS X  (no Windows Support)

## Example Usage 

``` c++
enum tables {
   book_table
}

/**
 * Defines a "table" for storing books. This table is assigned a 
 * globally unique ID (book_table) and must inherit from chainbase::object<> which
 * decorates the book type by defining "id_type" and "type_id" 
 */
struct book : public chainbase::object<book_table, book> {

   /** defines a default constructor for types that don't have
     * members requiring dynamic memory allocation.
     */
   CHAINBASE_DEFAULT_CONSTRUCTOR( book )
   
   id_type          id; ///< this manditory member is a primary key
   int pages        = 0;
   int publish_date = 0;
};

/**
 * This is a relatively standard boost multi_index_container definition that has three 
 * requirements to be used withn a chainbase database:
 *   - it must use chainbase::allocator<T> 
 *   - the first index must be on the primary key (id) and must be unique (hashed or ordered)
 */
typedef multi_index_container<
  book,
  indexed_by<
     ordered_unique< member<book,book::id_type,&book::id> >, ///< required 
     ordered_non_unique< BOOST_MULTI_INDEX_MEMBER(book,int,pages) >,
     ordered_non_unique< BOOST_MULTI_INDEX_MEMBER(book,int,publish_date) >
  >,
  chainbase::allocator<book> ///< required for use with chainbase::database
> book_index;

/**
    This simple program will open database_dir and add two new books every time
    it is run and then print out all of the books in the database.
 */
int main( int argc, char** argv ) {
   chainbase::database db;
   db.open( "database_dir", database::read_write, 1024*1024*8 ); /// open or create a database with 8MB capacity
   db.add_index< book_index >(); /// open or create the book_index 


   const auto& book_idx = db.get_index<book_index>().indicies();

   const auto& new_book300 = db.create<book>( [&]( book& b ) {
       b.pages = 300+book_idx.size();
   } );
   const auto& new_book400 = db.create<book>( []( book& b ) {
       b.pages = 300+book_idx.size();
   } );

   for( const auto& b : book_idx ) {
      std::cout << b.pages << "\n";
   }
   
   return 0;
}

```

## Background 

Blockchain applications depend upon a high performance database capable of millions of read/write 
operations per second.  Additionally blockchains operate on the basis of "eventually consistant" which
means that any changes made to the database are potentially reversible for an unknown amount of time depending
upon the consenus protocol used. 

Existing database such as [libbitcoin Database](https://github.com/libbitcoin/libbitcoin-database) achieve high
peformance using similar techniques (memory mapped files), but they are heavily specialised and do not implement
the logic necessary for multiple indicies or undo history. 

Databases such as LevelDB provide a simple Key/Value database, but suffer from poor performance relative to
memory mapped file implementations.

