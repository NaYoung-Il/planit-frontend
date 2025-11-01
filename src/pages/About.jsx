import Card from '../components/Card'
import Button from '../components/ui/Button'
import { useState } from 'react'

// About : 소개글 + 도움말 페이지
export default function About(){
  const [activeTab, setActiveTab] = useState('intro')

  return (
    <div className="flex flex-col gap-6 relative z-[1]">
      <Card title="소개 및 도움말" subtitle="Plan-it을 소개합니다" className="bg-bg-widget border-primary-dark/20 shadow-md m-6">
        {/* 탭 버튼 */}
        <div className="flex gap-3 mb-6 border-b border-primary-dark/10 pb-3">
          <Button 
            variant={activeTab === 'intro' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('intro')}
            className={activeTab === 'intro' ? '' : '!text-text-soft hover:!text-text'}
          >
            소개
          </Button>
          <Button 
            variant={activeTab === 'help' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('help')}
            className={activeTab === 'help' ? '' : '!text-text-soft hover:!text-text'}
          >
            도움말
          </Button>
        </div>

        {/* 소개 탭 */}
        {activeTab === 'intro' && (
          <div className="flex flex-col gap-6">
            <div className="bg-gradient-primary rounded-xl p-8 text-white shadow-lg">
              <h2 className="text-3xl font-bold mb-3">Plan-it</h2>
              <p className="text-lg opacity-90">여행을 더 특별하게</p>
            </div>

            <div className="bg-white/55 backdrop-blur rounded-xl p-6 border border-primary-dark/10">
              <h3 className="text-xl font-semibold text-text mb-4">✨ 주요 기능</h3>
              <div className="grid gap-4">
                <FeatureItem 
                  icon="🧳"
                  title="여행 계획"
                  description="여행 일정을 손쉽게 생성하고 관리할 수 있습니다."
                />
                <FeatureItem 
                  icon="📅"
                  title="캘린더 통합"
                  description="캘린더에서 여행 일정을 한눈에 확인하고 관리할 수 있습니다."
                />
                <FeatureItem 
                  icon="🌤️"
                  title="날씨 정보"
                  description="여행지의 실시간 날씨 정보를 제공합니다."
                />
                <FeatureItem 
                  icon="🗣️"
                  title="커뮤니티"
                  description="다른 여행자들과 후기를 공유하고 소통할 수 있습니다."
                />
              </div>
            </div>

            <div className="bg-white/55 backdrop-blur rounded-xl p-6 border border-primary-dark/10">
              <h3 className="text-xl font-semibold text-text mb-4">💡 Plan-it</h3>
              <div className="text-text-soft leading-relaxed space-y-3">
                <p>
                  Plan-it은 여행 계획부터 후기 공유까지 모든 과정을 하나의 플랫폼에서 관리할 수 있는 통합 여행 플래너 입니다.
                </p>
                <p>
                  직관적인 인터페이스와 실용적인 기능들로 여행 계획을 더욱 즐겁고 편리하게 만들어드립니다.
                </p>
                <p>
                  커뮤니티에서 다른 여행자들의 생생한 후기를 확인하고, 당신의 여행 이야기도 공유해보세요.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 도움말 탭 */}
        {activeTab === 'help' && (
          <div className="flex flex-col gap-6">
            <div className="bg-white/55 backdrop-blur rounded-xl p-6 border border-primary-dark/10">
              <h3 className="text-xl font-semibold text-text mb-4">🚀 시작하기</h3>
              <div className="space-y-4">
                <HelpItem 
                  step="1"
                  title="회원가입 및 로그인"
                  description="좌측 상단의 로그인 버튼을 클릭하여 회원가입 또는 로그인을 진행하세요."
                />
                <HelpItem 
                  step="2"
                  title="여행 계획 만들기"
                  description="'여행' 메뉴에서 '+ 새 여행' 버튼을 클릭하여 여행 계획을 생성하세요."
                />
                <HelpItem 
                  step="3"
                  title="일정 관리"
                  description="생성된 여행을 클릭하여 상세 일정을 추가하고 관리할 수 있습니다."
                />
                <HelpItem 
                  step="4"
                  title="후기 작성"
                  description="'커뮤니티' 메뉴에서 여행 후기를 작성하고 다른 사용자들과 공유하세요."
                />
              </div>
            </div>

            <div className="bg-white/55 backdrop-blur rounded-xl p-6 border border-primary-dark/10">
              <h3 className="text-xl font-semibold text-text mb-4">📖 주요 기능 사용법</h3>
              <div className="space-y-5">
                <GuideSection 
                  title="대시보드"
                  content="인기 여행지를 둘러보고 클릭하여 바로 여행 계획을 시작할 수 있습니다."
                />
                <GuideSection 
                  title="여행 관리"
                  content="저장된 여행 목록을 확인하고, 각 여행을 클릭하여 상세 정보를 수정할 수 있습니다. 여행 제목, 기간, 장소 등을 자유롭게 편집하세요."
                />
                <GuideSection 
                  title="캘린더 활용"
                  content="오른쪽 사이드바의 캘린더에서 날짜 범위를 선택하면 해당 기간으로 새 여행을 만들 수 있습니다."
                />
                <GuideSection 
                  title="커뮤니티"
                  content="여행 후기를 작성할 때는 여행을 선택하고, 제목, 내용, 평점을 입력한 후 사진을 첨부할 수 있습니다. 다른 사용자의 후기에 댓글과 좋아요를 남길 수도 있습니다."
                />
                <GuideSection 
                  title="프로필 설정"
                  content="사이드바의 프로필 이미지를 클릭하여 프로필 페이지로 이동하고, 프로필 사진과 개인 정보를 수정할 수 있습니다."
                />
              </div>
            </div>

            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
              <h3 className="text-lg font-semibold text-emerald-800 mb-2">💬 도움이 필요하신가요?</h3>
              <p className="text-emerald-700 text-sm">
                추가적인 도움이 필요하시면 고객센터로 문의해주세요.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

// 기능 소개 아이템 컴포넌트
function FeatureItem({ icon, title, description }){
  return (
    <div className="flex gap-4 items-start p-4 rounded-lg bg-surface border border-primary-dark/8 hover:shadow-md transition">
      <div className="text-3xl flex-shrink-0">{icon}</div>
      <div>
        <h4 className="font-semibold text-text mb-1">{title}</h4>
        <p className="text-sm text-text-soft">{description}</p>
      </div>
    </div>
  )
}

// 도움말 단계 아이템 컴포넌트
function HelpItem({ step, title, description }){
  return (
    <div className="flex gap-4 items-start">
      <div className="w-8 h-8 rounded-full bg-gradient-primary text-white font-bold flex items-center justify-center flex-shrink-0 shadow-md">
        {step}
      </div>
      <div>
        <h4 className="font-semibold text-text mb-1">{title}</h4>
        <p className="text-sm text-text-soft">{description}</p>
      </div>
    </div>
  )
}

// 가이드 섹션 컴포넌트
function GuideSection({ title, content }){
  return (
    <div>
      <h4 className="font-semibold text-text mb-2">• {title}</h4>
      <p className="text-sm text-text-soft pl-4">{content}</p>
    </div>
  )
}
