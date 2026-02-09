'use client'

export interface SocialPackPost {
  content: string
  charCount: number
  hashtags?: string
}

export interface SocialPackResult {
  twitter: SocialPackPost
  facebook: SocialPackPost
  instagram: SocialPackPost & { hashtags: string }
  linkedin: SocialPackPost
  tiktok: SocialPackPost
  nextdoor: SocialPackPost
}

const PLATFORM_INFO: Record<string, { name: string; icon: JSX.Element; color: string; bgColor: string }> = {
  twitter: {
    name: 'X (Twitter)',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    color: 'text-gray-900',
    bgColor: 'bg-gray-100',
  },
  facebook: {
    name: 'Facebook',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  instagram: {
    name: 'Instagram',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
    color: 'text-pink-600',
    bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
  tiktok: {
    name: 'TikTok',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
    color: 'text-gray-900',
    bgColor: 'bg-gray-50',
  },
  nextdoor: {
    name: 'Nextdoor',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/></svg>,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
}

const initial = (s: string) => s.charAt(0).toUpperCase()
const handle = (s: string) => s.toLowerCase().replace(/\s+/g, '')

interface SocialPackCardsProps {
  pack: SocialPackResult
  businessName: string
  industry?: string
  imageUrl?: string | null
  logoUrl?: string | null
}

export function SocialPackCards({ pack, businessName, industry = '', imageUrl, logoUrl }: SocialPackCardsProps) {
  const platforms = (Object.keys(pack) as Array<keyof SocialPackResult>).filter(
    (k) => pack[k]?.content != null
  )
  if (platforms.length === 0) return null

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {platforms.map((platform) => {
        const info = PLATFORM_INFO[platform]
        const post = pack[platform]
        if (!info || !post) return null
        const instagramPost = platform === 'instagram' ? (post as SocialPackResult['instagram']) : null

        const renderCard = () => {
          switch (platform) {
            case 'twitter':
              return (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-4">
                    <div className="flex gap-3">
                      {logoUrl ? (
                        <img src={logoUrl} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {initial(businessName)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-gray-900 text-sm truncate">{businessName}</span>
                        </div>
                        <span className="text-gray-500 text-sm">@{handle(businessName)} · 1m</span>
                        <p className="mt-2 text-gray-900 text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
                        {imageUrl && (
                          <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200">
                            <img src={imageUrl} alt="" className="w-full h-auto object-contain" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Twitter engagement bar */}
                  <div className="px-4 pb-3 pl-[64px]">
                    <div className="flex justify-between text-gray-500 text-[13px] max-w-[300px]">
                      <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> 12</span>
                      <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> 48</span>
                      <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> 156</span>
                    </div>
                  </div>
                </div>
              )
            case 'facebook':
              return (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 pb-3">
                    <div className="flex items-center gap-3 mb-3">
                      {logoUrl ? (
                        <img src={logoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                          {initial(businessName)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900 text-[15px]">{businessName}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">Just now · <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.5 15l-5-5 1.41-1.41L10.5 14.17l7.09-7.09L19 8.5l-8.5 8.5z"/></svg></div>
                      </div>
                    </div>
                    <p className="text-gray-900 text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  </div>
                  {imageUrl && <img src={imageUrl} alt="" className="w-full h-auto object-contain" />}
                  {/* Facebook reactions bar */}
                  <div className="px-4 py-2.5">
                    <div className="flex items-center justify-between text-[13px] text-gray-500 pb-2.5 border-b border-gray-200">
                      <span className="flex items-center gap-1">👍❤️ 24</span>
                      <span>3 comments</span>
                    </div>
                    <div className="flex justify-around pt-1.5 text-gray-600 font-semibold text-[13px]">
                      <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg> Like</span>
                      <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> Comment</span>
                      <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg> Share</span>
                    </div>
                  </div>
                </div>
              )
            case 'instagram':
              return (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between p-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      {logoUrl ? (
                        <img src={logoUrl} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-pink-500" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-0.5">
                          <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-700">
                            {initial(businessName)}
                          </div>
                        </div>
                      )}
                      <span className="font-semibold text-sm text-gray-900">@{handle(businessName)}</span>
                    </div>
                  </div>
                  {imageUrl ? (
                    <img src={imageUrl} alt="" className="w-full aspect-square object-cover" />
                  ) : (
                    <div className="w-full aspect-square bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 flex items-center justify-center">
                      <span className="text-4xl">📸</span>
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-sm text-gray-900"><span className="font-semibold">@{handle(businessName)}</span> {post.content}</p>
                    {instagramPost?.hashtags && (
                      <p className="text-sm text-blue-900 mt-1">{instagramPost.hashtags}</p>
                    )}
                  </div>
                </div>
              )
            case 'linkedin':
              return (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 pb-3">
                    <div className="flex gap-3 mb-3">
                      {logoUrl ? (
                        <img src={logoUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold">
                          {initial(businessName)}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{businessName}</div>
                        <div className="text-xs text-gray-500">Local {industry || 'Business'} Expert</div>
                        <div className="text-xs text-gray-400">1h · <svg className="w-3 h-3 inline" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1.5 15l-5-5 1.41-1.41L10.5 14.17l7.09-7.09L19 8.5l-8.5 8.5z"/></svg></div>
                      </div>
                    </div>
                    <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  </div>
                  {imageUrl && <img src={imageUrl} alt="" className="w-full h-auto object-contain" />}
                  {/* LinkedIn engagement bar */}
                  <div className="px-4 py-2.5">
                    <div className="flex items-center justify-between text-[12px] text-gray-500 pb-2 border-b border-gray-200">
                      <span>👍 18</span>
                      <span>2 comments</span>
                    </div>
                    <div className="flex justify-around pt-1.5 text-gray-600 font-semibold text-[13px]">
                      <span>👍 Like</span>
                      <span>💬 Comment</span>
                      <span>🔁 Repost</span>
                      <span>📤 Send</span>
                    </div>
                  </div>
                </div>
              )
            case 'tiktok':
              return (
                <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
                  <div className="relative">
                    {imageUrl ? (
                      <img src={imageUrl} alt="" className="w-full aspect-[9/16] object-cover" />
                    ) : (
                      <div className="w-full aspect-[9/16] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <span className="text-6xl">🎵</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="font-semibold text-white text-sm mb-1">@{handle(businessName)}</div>
                      <p className="text-white text-sm leading-relaxed">{post.content}</p>
                    </div>
                  </div>
                </div>
              )
            case 'nextdoor':
              return (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-green-600 px-4 py-2 flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">Nextdoor</span>
                  </div>
                  <div className="p-4">
                    <div className="flex gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                        {initial(businessName)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{businessName}</div>
                        <div className="text-xs text-gray-500">✓ Verified Business · Your neighborhood</div>
                      </div>
                    </div>
                    <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap mb-3">{post.content}</p>
                    {imageUrl && <div className="rounded-lg overflow-hidden mb-3"><img src={imageUrl} alt="" className="w-full h-auto object-contain" /></div>}
                  </div>
                </div>
              )
            default:
              return (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                </div>
              )
          }
        }

        return (
          <div key={platform} className="relative">
            <div className={`absolute -top-3 left-4 z-10 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm ${info.bgColor} ${info.color} border border-white`}>
              {info.icon}
              <span>{info.name}</span>
            </div>
            {renderCard()}
          </div>
        )
      })}
    </div>
  )
}
