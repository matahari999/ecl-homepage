const Blog = () => {
  const posts = [
    {
      id: 1,
      title: '장기요양등급 신청하는 방법 완벽 가이드',
      excerpt: '어르신 돌봄을 위한 첫 걸음, 국민건강보험공단 장기요양등급 신청 절차와 필요 서류를 알기 쉽게 설명해 드립니다.',
      date: '2025. 02. 20',
      category: '방문요양',
      image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 2,
      title: '좋은 요양병원을 선택하는 5가지 기준',
      excerpt: '수많은 요양병원 중 우리 부모님께 딱 맞는 곳을 고르기 위해 반드시 확인해야 할 체크리스트를 공유합니다.',
      date: '2025. 02. 10',
      category: '요양병원',
      image: 'https://images.unsplash.com/photo-1538137524007-21e48ea5ebdc?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 3,
      title: '선불제 상조 vs 후불제 상조, 차이점은?',
      excerpt: '장례 준비를 앞두고 고민하시는 분들을 위해 선불제 상조와 후불제 상조의 장단점을 명확하게 비교해 드립니다.',
      date: '2025. 01. 25',
      category: '상조 정보',
      image: 'https://images.unsplash.com/photo-1601625907474-511475c40bc9?q=80&w=600&auto=format&fit=crop'
    }
  ];

  return (
    <div className="flex flex-col w-full bg-slate-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">블로그</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            시니어 케어, 장기요양보험, 장례 정보 등 유익하고 실질적인 정보를 전해드립니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article key={post.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-slate-100 overflow-hidden flex flex-col h-full cursor-pointer group">
              <div className="w-full h-48 overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover max-w-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 md:p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {post.category}
                  </span>
                  <span className="text-xs text-slate-400">{post.date}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-grow">
                  {post.excerpt}
                </p>
                <div className="mt-auto">
                  <span className="text-blue-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    자세히 보기 <span>→</span>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
