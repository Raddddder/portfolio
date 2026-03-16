import { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import InputForm from './components/InputForm';
import Feed from './components/Feed';
import Assistant from './components/Assistant';
import BottomNav from './components/BottomNav';
import BountyReward from './components/BountyReward';
import { Record, UserProfile, getTitle } from './types';
import { initialRecords } from './mockData';
import { getDeviceInfo, DeviceInfo } from './utils/deviceId';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(true);
  useEffect(() => {
    const check = () => {
      const ua = navigator.userAgent;
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      setIsMobile(mobile);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export default function App() {
  const [hasSubmittedFirstRecord, setHasSubmittedFirstRecord] = useState(false);
  const [currentView, setCurrentView] = useState<'welcome' | 'form' | 'feed' | 'assistant'>('welcome');
  const [records, setRecords] = useState<Record[]>(initialRecords);
  const [prefillStoreName, setPrefillStoreName] = useState<string>('');
  const [isBountySubmission, setIsBountySubmission] = useState(false);
  const [showBountyReward, setShowBountyReward] = useState(false);
  const [bountyStoreName, setBountyStoreName] = useState('');
  const [completedBounties, setCompletedBounties] = useState<string[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const isMobile = useIsMobile();
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '新晋情报员',
    recordsCount: 0,
    stampsReceived: 0
  });

  // Initialize device info on mount
  useEffect(() => {
    const info = getDeviceInfo();
    setDeviceInfo(info);
    console.log(`[食录] 设备: ${info.deviceId} | 第${info.visitCount}次访问 | ${info.isReturning ? '回访' : '新用户'}`);
    // Always start from welcome
    setCurrentView('welcome');
  }, []);

  const handleAddRecord = (newRecordData: Omit<Record, 'id' | 'stamps' | 'createdAt' | 'author' | 'campus'>) => {
    // 悬赏提交额外加 3 声望
    const bonusStamps = isBountySubmission ? 3 : 0;

    const newRecord: Record = {
      ...newRecordData,
      id: Math.random().toString(36).substr(2, 9),
      stamps: bonusStamps,
      createdAt: Date.now(),
      author: userProfile.name,
      campus: '仙林校区',
    };

    setRecords(prev => {
      const filtered = prev.filter(r => r.storeName !== newRecord.storeName);
      return [newRecord, ...filtered];
    });
    
    setUserProfile(prev => ({ 
      ...prev, 
      recordsCount: prev.recordsCount + 1,
      stampsReceived: prev.stampsReceived + bonusStamps,
    }));

    if (!hasSubmittedFirstRecord) {
      setHasSubmittedFirstRecord(true);
    }

    if (isBountySubmission) {
      // 悬赏提交 → 弹奖励页
      setBountyStoreName(newRecordData.storeName);
      setCompletedBounties(prev => [...prev, newRecordData.storeName]);
      setShowBountyReward(true);
      setIsBountySubmission(false);
    }
    
    setPrefillStoreName('');
    setCurrentView('feed');
  };

  const handleStamp = (id: string) => {
    setRecords(prev => prev.map(r => {
      if (r.id === id) {
        if (r.author === userProfile.name) {
          setUserProfile(p => ({ ...p, stampsReceived: p.stampsReceived + 1 }));
        }
        return { ...r, stamps: r.stamps + 1 };
      }
      return r;
    }));
  };

  const showBottomNav = currentView === 'feed' || currentView === 'assistant';

  return (
    <div className="min-h-screen bg-paper text-ink font-serif selection:bg-stamp/20 selection:text-stamp relative">
      {currentView === 'welcome' && (
        <WelcomeScreen 
          onStart={() => setCurrentView(hasSubmittedFirstRecord ? 'feed' : 'form')} 
          buttonText={hasSubmittedFirstRecord ? "返回食录" : "执笔记录"}
          deviceInfo={deviceInfo}
          isMobile={isMobile}
        />
      )}
      {currentView === 'form' && (
        <InputForm 
          onSubmit={handleAddRecord} 
          onBack={() => setCurrentView(hasSubmittedFirstRecord ? 'feed' : 'welcome')}
          prefillStoreName={prefillStoreName}
        />
      )}
      {currentView === 'feed' && (
        <Feed 
          records={records} 
          userProfile={userProfile}
          onAddRecord={(storeName?: string) => {
            if (storeName) setPrefillStoreName(storeName);
            setCurrentView('form');
          }}
          onBountyAccept={(storeName: string) => {
            setPrefillStoreName(storeName);
            setIsBountySubmission(true);
            setCurrentView('form');
          }}
          completedBounties={completedBounties}
          onShowWelcome={() => setCurrentView('welcome')}
          onStamp={handleStamp}
        />
      )}
      {currentView === 'assistant' && (
        <Assistant records={records} userProfile={userProfile} />
      )}

      {showBottomNav && (
        <BottomNav currentView={currentView} onChangeView={setCurrentView} />
      )}

      {showBountyReward && (
        <BountyReward
          storeName={bountyStoreName}
          onClose={() => setShowBountyReward(false)}
          newTitle={getTitle(userProfile.recordsCount)}
          recordsCount={userProfile.recordsCount}
        />
      )}
    </div>
  );
}
