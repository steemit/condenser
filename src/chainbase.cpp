#include <chainbase.hpp>
#include <boost/array.hpp>

#include <iostream>

namespace chainbase {

   struct environment_check {
      environment_check() {
         memset( &compiler_version, 0, sizeof( compiler_version ) );
         memcpy( &compiler_version, __VERSION__, std::min<size_t>( strlen(__VERSION__), 256 ) );
#ifndef NDEBUG
         debug = true;
#endif
#ifdef __APPLE__
         apple = true;
#endif
#ifdef WIN32
         windows = true;
#endif
      }
      friend bool operator == ( const environment_check& a, const environment_check& b ) {
         return std::make_tuple( a.compiler_version, a.debug, a.apple, a.windows )
            ==  std::make_tuple( b.compiler_version, b.debug, b.apple, b.windows );
      }

      boost::array<char,256>  compiler_version;
      bool                    debug = false;
      bool                    apple = false;
      bool                    windows = false;
   };

   void database::open( const bfs::path& dir, int flags, uint64_t shared_file_size ) {

      bool write = flags & database::read_write;

      if( !bfs::exists( dir ) ) {
         if( !write ) BOOST_THROW_EXCEPTION( std::runtime_error( "database file not found at " + dir.native() ) );
      }
      
      bfs::create_directories( dir );
      if( _data_dir != dir ) close();

      _data_dir = dir;
      auto abs_path = bfs::absolute( dir / "shared_memory" );

      if( bfs::exists( abs_path ) )
      {
         if( write ) {
            _segment.reset( new bip::managed_mapped_file( bip::open_only,
                                                          abs_path.generic_string().c_str()
                                                          ) );
         } else {
            _segment.reset( new bip::managed_mapped_file( bip::open_read_only,
                                                          abs_path.generic_string().c_str()
                                                          ) );
            _read_only = true;
         }

         auto env = _segment->find< environment_check >( "environment" );
         if( !env.first || !( *env.first == environment_check()) ) {
            BOOST_THROW_EXCEPTION( std::runtime_error( "database created by a different compiler, build, or operating system" ) );
         }
      } else {
         _segment.reset( new bip::managed_mapped_file( bip::create_only,
                                                       abs_path.generic_string().c_str(), shared_file_size
                                                       ) );
         _segment->find_or_construct< environment_check >( "environment" )();
      }
   }

   void database::flush() {
      if( _segment )
         _segment->flush();
   }

   void database::close()
   {
      _segment.reset();
      _data_dir = bfs::path();
   }

   void database::wipe( const bfs::path& dir )
   {
      _segment.reset();
      bfs::remove_all( dir / "shared_memory" );
      _data_dir = bfs::path();
   }

   void database::undo()
   {
      for( auto& item : _index_list )
      {
         item->undo();
      }
   }
   void database::squash()
   {
      for( auto& item : _index_list )
      {
         item->squash();
      }
   }
   void database::commit( int64_t revision )
   {
      for( auto& item : _index_list )
      {
         item->commit( revision );
      }
   }

   void database::undo_all()
   {
      for( auto& item : _index_list )
      {
         item->undo_all();
      }
   }

   database::session database::start_undo_session( bool enabled )
   {
      if( enabled ) {
         vector< std::unique_ptr<abstract_session> > _sub_sessions;
         _sub_sessions.reserve( _index_list.size() );
         for( auto& item : _index_list ) {
            _sub_sessions.push_back( item->start_undo_session( enabled ) );
         }
         return session( std::move( _sub_sessions ) );
      } else {
         return session();
      }
   }

}  // namespace chainbase


